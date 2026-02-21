import os
import flet as ft
import asyncio
import pandas as pd
import math
import random
import json
import sys

APP_NAME = "Moderator Tool"
CONFIG_FILENAME = "user_config.json"

def get_config_path():
    if sys.platform == "win32":
        appdata = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
        folder = os.path.join(appdata, APP_NAME)
    elif sys.platform == "darwin":
        folder = os.path.join(os.path.expanduser("~/Library/Application Support/"), APP_NAME)
    else:
        folder = os.path.join(os.path.expanduser("~/.config/"), APP_NAME)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, CONFIG_FILENAME)

CONFIG_FILE = get_config_path()

# CONFIG_FILE = "user_config.json"

default_config = {
    "top_booklet": 20,
    "middle_booklet": 40,
    "bottom_booklet": 40,
    "top_pick": 5,
    "middle_pick": 10,
    "bottom_pick": 5,
    "individual_toggle": True,
    "bulk_toggle": True
}

REQUIRED_COLUMNS = ["Register Number", "Name of the student", "Schedule Id", "Schedule Name", "Email of the student", "Total Marks", "Exam Appearance Status", "Evaluated By", "Evaluator Id", "Script Id", "Cycle"]
alternate_eval_choice = None
sole_evaluator = None
master_bulk_allocation_df = None
skip_processing_current_file = False

count_valid_format_files = 0
count_invalid_format_files = 0
count_successfully_processed_files = 0
count_unusual_evaluation_cycle_files = 0
count_user_skipped_files = 0


list_valid_format_files = set()
list_invalid_format_files = set()
list_successfully_processed_files = set()
list_unusual_evaluation_cycle_files = set()
list_user_skipped_files = set()

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
                # Merge loaded config with default_config to ensure keys
                return {**default_config, **config}
        except Exception as e:
            print(f"Failed to load config: {e}")
    return default_config.copy()

def save_config(config):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4)
        print("Config saved.")
    except Exception as e:
        print(f"Failed to save config: {e}")

def validate_input_file(file1_path):
    def get_missing_columns(file_path):
        try:
            df = pd.read_excel(file_path, sheet_name=0)
            return [col for col in REQUIRED_COLUMNS if col not in df.columns]
        except Exception as e:
            return REQUIRED_COLUMNS

    missing_values = get_missing_columns(file1_path)

    valid_file = not missing_values
    missing_columns = {
        file1_path: missing_values if not valid_file else []
    }

    return valid_file, missing_columns

def section_header(title: str, subtitle: str) -> ft.Container:
    return ft.Container(
        content=ft.Column([
            ft.Text(title, style="titleMedium", color="#3F3D56"),
            ft.Text(subtitle, size=11, italic=True, color="gray")
        ], spacing=2),
        col={"xs": 12, "md": 3}
    )

def percentage_input(label: str, value: int, suffix_text: str, on_update_callback=None) -> ft.TextField:
    def on_blur(e: ft.ControlEvent):
        cleaned = ''.join(filter(str.isdigit, e.control.value))
        if e.control.value != cleaned:
            e.control.value = cleaned
            e.control.update()

        if on_update_callback:
            on_update_callback()

    return ft.TextField(
        label=label,
        dense=True,
        value=str(value),
        suffix=ft.Text(suffix_text, size=11, italic=True),
        keyboard_type=ft.KeyboardType.NUMBER,
        border_color="grey",
        on_blur=on_blur
    )

def labeled_toggle(text: str, toggle: ft.Switch, align="start", col_span=4) -> ft.Container:
    return ft.Container(
        content=ft.Row(
            [
                ft.Text(text, size=14, weight=ft.FontWeight.W_500, color="#3F3D56"),
                toggle
            ],
            alignment=getattr(ft.MainAxisAlignment, align.upper()),
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            spacing=10
        ),
        col={"xs": 12, "md": col_span}
    )

def responsive_input_row(title: str, subtitle: str, inputs: list[ft.TextField]) -> ft.ResponsiveRow:
    return ft.ResponsiveRow(
        controls=[
            section_header(title, subtitle),
            *[ft.Container(field, col={"xs": 12, "md": 3}) for field in inputs]
        ],
        spacing=10,
        run_spacing=10,
    )


# ---------- Main App ----------

async def main(page: ft.Page):
    page.title = "Moderator Allocation Tool"
    page.scroll = True
    page.padding = 20
    user_config = load_config()

    async def on_run_click(e):
        run_button.disabled = True  # 🔒 Disable button at start
        run_button.update()

        # Import global variables
        global count_valid_format_files
        global count_invalid_format_files
        global count_successfully_processed_files 
        global count_unusual_evaluation_cycle_files
        global count_user_skipped_files

        global list_valid_format_files
        global list_invalid_format_files
        global list_successfully_processed_files
        global list_unusual_evaluation_cycle_files
        global list_user_skipped_files

        global alternate_eval_choice
        global master_bulk_allocation_df

        # Reset counters
        count_valid_format_files = 0
        count_invalid_format_files = 0
        count_successfully_processed_files = 0 
        count_unusual_evaluation_cycle_files = 0
        count_user_skipped_files = 0

        # Reset lists
        list_valid_format_files.clear()
        list_invalid_format_files.clear()
        list_successfully_processed_files.clear()
        list_unusual_evaluation_cycle_files.clear()
        list_user_skipped_files.clear()

        # global sole_evaluator
        if bulk_toggle.value:
            master_bulk_allocation_df = pd.DataFrame()
        else:
            master_bulk_allocation_df = None


        selected_files = page.session.get("selected_files") or []
        has_valid_files = len(selected_files) > 0
        category_valid = validate_category_total()
        pick_valid = validate_pick_total()

        if not has_valid_files:
            page.open(ft.SnackBar(
                content=ft.Text("⚠️ Please select at least one Excel file."),
                behavior=ft.SnackBarBehavior.FLOATING,
                duration=3000,
                bgcolor="red"
            ))
            run_button.disabled = False  # 🔓 Re-enable on early return
            run_button.update()
            return

        if not category_valid:
            page.open(ft.SnackBar(
                content=ft.Text("⚠️ Booklet categorization total must be exactly 100%."),
                behavior=ft.SnackBarBehavior.FLOATING,
                duration=3000,
                bgcolor="red"
            ))
            run_button.disabled = False
            run_button.update()
            return

        if not pick_valid:
            run_button.disabled = False
            run_button.update()
            return

        progress_container.visible = True
        progress_bar.value = 0
        page.update()

        total = len(selected_files)

        for index, file_path in enumerate(selected_files, start=1):
            processing_label.visible = True
            processing_label.value = f"Processing file ({index}/{total}): {file_path.split('/')[-1]}"
            progress_bar.value = index / total
            page.update()

            file_validity, missing_columns = validate_input_file(file_path)
            if file_validity:
                count_valid_format_files += 1
                list_valid_format_files.add(file_path.split('/')[-1])
                add_log_line(f"🟢 Started Processing {os.path.splitext(os.path.basename(file_path))[0]}")
                add_log_line(f"{" " * 8}✅ File format is valid.")
                result = await process_test(
                    file_path=file_path,
                    top_selected_booklets=int(top_booklet_input.value),
                    middle_selected_booklets=int(middle_booklet_input.value),
                    bottom_selected_booklets=int(bottom_booklet_input.value),
                    top_picked_booklets=int(top_pick_input.value),
                    middle_picked_booklets=int(middle_pick_input.value),
                    bottom_picked_booklets=int(bottom_pick_input.value),
                    individual_files=individual_toggle.value,
                    bulk_file=bulk_toggle.value
                )
            else:
                list_invalid_format_files.add(os.path.splitext(os.path.basename(file_path))[0])
                count_invalid_format_files += 1
                add_log_line(f"🔴 Skipped Processing {os.path.splitext(os.path.basename(file_path))[0]}")
                add_log_line(f"{" " * 8}⛔ The file format is invalid.")
                add_log_line(f"{" " * 8}⛔ Missing columns are: {', '.join(missing_columns[file_path])}")
                await asyncio.sleep(1)
                continue

        success_df = pd.DataFrame(list_successfully_processed_files, columns=["Successfully Processed Files"])
        skippped_unusual_cycle_df = pd.DataFrame(list_unusual_evaluation_cycle_files, columns=["Processing skipped because of unusual cycles"])
        skippped_by_user_df = pd.DataFrame(list_user_skipped_files, columns=["Processing skipped because of user input"])
        invalid_files_df = pd.DataFrame(list_invalid_format_files, columns=["Processing skipped because of invalid file format"])

        if bulk_toggle:
            dir_path = os.path.dirname(selected_files[0])
            filename = f'master_bulk_allocation_file.xlsx'
            output_file = os.path.join(dir_path, f'{filename}')
            with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                master_bulk_allocation_df.to_excel(writer, sheet_name='MasterBulkAllocation', index=False)
                success_df.to_excel(writer, sheet_name='SuccessfullyProcessed', index=False)
                skippped_unusual_cycle_df.to_excel(writer, sheet_name='UnusualCycleSkipped', index=False)
                skippped_by_user_df.to_excel(writer, sheet_name='SkippedByUser', index=False)
                invalid_files_df.to_excel(writer, sheet_name='InvalidFile', index=False)
            add_log_line(" ")
            add_log_line(f"✅ Bulk Master file successfully processed and saved at {output_file}")

        progress_container.visible = True
        processing_label.visible = True
        processing_label.value = "🎉🎉🎉 Congratulations!!! All files processed successfully!"

        page.update()

        add_log_line(" ")
        add_log_line(" ")
        add_log_line("Processing Summary")
        add_log_line(f'{" " * 8} ☑ Pick {int(top_pick_input.value)}% from Top {int(top_booklet_input.value)}% booklets')
        add_log_line(f'{" " * 8} ☑ Pick {int(middle_pick_input.value)}% from Middle {int(middle_booklet_input.value)}% booklets')
        add_log_line(f'{" " * 8} ☑ Pick {int(bottom_pick_input.value)}% from Bottom {int(bottom_booklet_input.value)}% booklets')
        add_log_line(f'Individual File Toggle: {"ON" if individual_toggle.value else "OFF"}')
        add_log_line(f'Bulk File Toggle: {"ON" if bulk_toggle.value else "OFF"}')

        add_log_line(f" ")
        add_log_line(f"Total valid files found: {count_valid_format_files}")
        add_log_line(f"{" " * 8} - Successfully processed: {count_successfully_processed_files}")
        if list_successfully_processed_files:
            for element in list_successfully_processed_files:
                add_log_line(f"{" " * 12} - {element}")
        
        
        add_log_line(f"{" " * 8} - Skipped due to unusual cycle: {count_unusual_evaluation_cycle_files}")
        if list_unusual_evaluation_cycle_files:
            for element in list_unusual_evaluation_cycle_files:
                add_log_line(f"{" " * 12} - {element}")
        
        add_log_line(f"{" " * 8} - Skipped because of user choice: {count_user_skipped_files}")
        if list_user_skipped_files:
            for element in list_user_skipped_files:
                add_log_line(f"{" " * 12} - {element}")

        add_log_line(f" ")
        add_log_line(f"Total invalid files found: {count_invalid_format_files}")
        for element in list_invalid_format_files:
            add_log_line(f"{" " * 8} - {element}")

        if bulk_toggle.value:
            add_log_line(" ")
            add_log_line(f"Master Bulk Files: {output_file}")

        await asyncio.sleep(1)
        page.open(ft.SnackBar(
            content=ft.Text(f"✅ Successfully processed {total} file(s)."),
            bgcolor="#2DB567",
            duration=3000,
            behavior=ft.SnackBarBehavior.FLOATING
        ))        

        run_button.disabled = False  # 🔓 Re-enable button after processing
        run_button.update()

    def ensure_one_toggle_active(changed: str):
        if not individual_toggle.value and not bulk_toggle.value:
            # Re-enable the one that wasn't changed
            if changed == "individual":
                bulk_toggle.value = True
            else:
                individual_toggle.value = True
            page.update()

    def validate_category_total():
        total = 0
        for field in categorization_inputs:
            if field.value.isdigit():
                total += int(field.value)

        is_valid = total == 100

        for field in categorization_inputs:
            field.border_color = "grey" if is_valid else "red"
            field.border_width = 2 if not is_valid else 1
            field.label_color = "red" if not is_valid else "grey"
            field.label_style = ft.TextStyle(
                color="red" if not is_valid else None,
                weight=ft.FontWeight.W_600 if not is_valid else None
            )
            field.update()
        if not is_valid:
            page.open(
                ft.SnackBar(
                    content=ft.Text(f"⚠️ Total selected booklets must be exactly 100%. Current total: {total}%", size=12),
                    bgcolor="red",
                    behavior=ft.SnackBarBehavior.FLOATING,
                    duration=2000
                )
            )
        return is_valid

    def validate_pick_total():
        total = 0
        for field in pick_inputs:
            if field.value.isdigit():
                total += int(field.value)
        
        is_valid = total <= 100

        # Update border colors based on validity
        for field in pick_inputs:
            field.border_color = "grey" if is_valid else "red"
            field.border_width = 2 if not is_valid else 1
            field.label_color = "red" if not is_valid else "grey"
            field.label_style = ft.TextStyle(color="red" if not is_valid else None, weight=ft.FontWeight.W_600 if not is_valid else None)
            field.update()

        if not is_valid:
            page.open(
                ft.SnackBar(
                    content=ft.Text(f"⚠️ Total pick must be <= 100%. Current total: {total}%", size=12),
                    bgcolor="red",
                    behavior=ft.SnackBarBehavior.FLOATING,
                    duration=2000
                )
            )
        return is_valid

    # Define toggles
    allow_config_toggle = ft.Switch(value=False, scale=0.6,on_change=lambda e: toggle_percentage_inputs(allow_config_toggle.value))
    # individual_toggle = ft.Switch(value=True, scale=0.6, on_change=lambda e: ensure_one_toggle_active("individual"))
    # bulk_toggle = ft.Switch(value=True, scale=0.6, on_change=lambda e: ensure_one_toggle_active("bulk"))
    individual_toggle = ft.Switch(value=user_config["individual_toggle"], scale=0.6, on_change=lambda e: ensure_one_toggle_active("individual"))
    bulk_toggle = ft.Switch(value=user_config["bulk_toggle"], scale=0.6, on_change=lambda e: ensure_one_toggle_active("bulk"))

    # Define inputs
    # top_booklet_input = percentage_input("Select top", 20, "% booklets", on_update_callback=validate_category_total)
    # middle_booklet_input = percentage_input("Select middle", 40, "% booklets", on_update_callback=validate_category_total)
    # bottom_booklet_input = percentage_input("Select bottom", 40, "% booklets", on_update_callback=validate_category_total)
    # top_pick_input = percentage_input("Pick", 5, "% booklets from top", on_update_callback=validate_pick_total)
    # middle_pick_input = percentage_input("Pick", 10, "% booklets from middle", on_update_callback=validate_pick_total)
    # bottom_pick_input = percentage_input("Pick", 5, "% booklets from bottom", on_update_callback=validate_pick_total)
    top_booklet_input = percentage_input("Select top", user_config["top_booklet"], "% booklets", on_update_callback=validate_category_total)
    middle_booklet_input = percentage_input("Select middle", user_config["middle_booklet"], "% booklets", on_update_callback=validate_category_total)
    bottom_booklet_input = percentage_input("Select bottom", user_config["bottom_booklet"], "% booklets", on_update_callback=validate_category_total)
    top_pick_input = percentage_input("Pick", user_config["top_pick"], "% booklets from top", on_update_callback=validate_pick_total)
    middle_pick_input = percentage_input("Pick", user_config["middle_pick"], "% booklets from middle", on_update_callback=validate_pick_total)
    bottom_pick_input = percentage_input("Pick", user_config["bottom_pick"], "% booklets from bottom", on_update_callback=validate_pick_total)

    categorization_inputs = [top_booklet_input, middle_booklet_input, bottom_booklet_input]
    pick_inputs = [top_pick_input, middle_pick_input, bottom_pick_input]

    def toggle_percentage_inputs(enabled: bool):
        for input_field in [
            top_booklet_input,
            middle_booklet_input,
            bottom_booklet_input,
            top_pick_input,
            middle_pick_input,
            bottom_pick_input,
        ]:
            input_field.disabled = not enabled
            input_field.update()

    def update_run_button_label():
        selected_files = page.session.get("selected_files") or []
        if selected_files:
            run_button.text = f"Process {len(selected_files)} File{'s' if len(selected_files) > 1 else ''}"
        else:
            run_button.text = "Run"
        run_button.update()


    run_button = ft.ElevatedButton(
        text="Run",
        on_click=on_run_click,
        style=ft.ButtonStyle(
            padding=20,
            elevation={"hovered": 6, "pressed": 2, "default": 2, "disabled": 0},
            bgcolor={"default": "blue", "hovered": "blue600", "pressed": "blue700", "disabled": "grey300"},
            color={"default": "white", "disabled": "grey600"},
            shape=ft.RoundedRectangleBorder(radius=6),
            animation_duration=300
        )
    )

    def save_defaults(e):
        config = {
            "top_booklet": int(top_booklet_input.value),
            "middle_booklet": int(middle_booklet_input.value),
            "bottom_booklet": int(bottom_booklet_input.value),
            "top_pick": int(top_pick_input.value),
            "middle_pick": int(middle_pick_input.value),
            "bottom_pick": int(bottom_pick_input.value),
            "individual_toggle": individual_toggle.value,
            "bulk_toggle": bulk_toggle.value
        }
        save_config(config)  # <-- This should be your function that writes to JSON
        page.open(ft.SnackBar(content=ft.Text("Defaults saved!"), bgcolor="green"))


    save_defaults_button = ft.ElevatedButton(
        text="Save Current as Default",
        icon=ft.Icons.SAVE,
        on_click=save_defaults,  # (define this function below, if not already)
        style=ft.ButtonStyle(
            padding=10,
            elevation={"hovered": 6, "pressed": 2, "default": 2, "disabled": 0},
            bgcolor={
                "default": "#3F3D56",     # Default
                "hovered": "#353349",     # Slightly darker
                "pressed": "#2B293C",     # Darker pressed
                "disabled": "#C7C7CC"     # Light grey
            },
            color={
                "default": "white",
                "disabled": "#888888"
            },
            shape=ft.RoundedRectangleBorder(radius=6),
            animation_duration=300
        )
    )

    run_button.on_click = on_run_click
    # ---------- UI Layout ----------
    page.add(
        ft.Row([
            ft.Text("Moderator Allocation App", style="headlineSmall", color="#3F3D56", weight="bold", expand=True),
            ft.Image(src="assets/CodeTantra.png", height=30, fit=ft.ImageFit.CONTAIN)
        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
    )
    page.add(ft.Divider(height=5, thickness=0.2, color="grey"))

    page.add(
        ft.Row(
            [
                ft.Row(  # Group text and toggle together
                    [
                        ft.Text(
                            "Configure booklets distributions and pickup",
                            style="titleMedium", color="blue", weight="bold"
                        ),
                        allow_config_toggle
                    ],
                    alignment=ft.MainAxisAlignment.START,
                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                    expand=True
                ),
                save_defaults_button
            ],
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
        )
    )

    # Booklet categorization row
    page.add(responsive_input_row(
        "Booklet Categorization",
        "Categorise booklets",
        [top_booklet_input, middle_booklet_input, bottom_booklet_input]
    ))

    # Booklet picking row
    page.add(responsive_input_row(
        "Picking Criteria",
        "Pick from each category",
        [top_pick_input, middle_pick_input, bottom_pick_input]
    ))

    toggle_percentage_inputs(False)

    # Add output files row
    page.add(
        ft.ResponsiveRow(
            controls=[
                section_header("Output File", "Choose what to generate"),
                ft.Container(
                    content=ft.Row(
                        [
                            ft.Container(labeled_toggle("Generate schedule-wise file(s)", individual_toggle), expand=True),
                            ft.Container(labeled_toggle("Generate Bulk file", bulk_toggle), expand=True),
                        ],
                        spacing=10,
                        alignment=ft.MainAxisAlignment.SPACE_BETWEEN
                    ),
                    col={"xs": 12, "md": 9}
                ),
            ],
            spacing=10,
            run_spacing=10,
        )
    )

    page.add(ft.Divider(height=5, thickness=0.2, color="grey"))
# ------------------- FILE PICKER COMPONENTS -------------------
    # Row of chips (already wrap-enabled)
    file_chips = ft.Row(wrap=True, spacing=8, run_spacing=8)

    # Scrollable container for chips
    chip_scroll_container = ft.Container(
        content=ft.Column(
            controls=[file_chips],
            scroll=ft.ScrollMode.AUTO,
        ),
        border=None,  # <- ensure no default border
        bgcolor=None,
        border_radius=ft.border_radius.all(8),
        padding=0
    )

    empty_label = ft.Text(
        "Selected files will appear here",
        size=12,
        italic=True,
        color="grey600",
        visible=True  # default state
    )

    # Box that animates visibility
    chip_container_box = ft.Container(
        content=chip_scroll_container,
        alignment=ft.alignment.top_left,
        expand=True,
        visible=False,
        bgcolor=None,
        border=None,
        border_radius=ft.border_radius.all(8),
        padding=10,
        opacity=0.0,
        scale=ft.Scale(0.95),
        offset=ft.Offset(0, 0.1),
        animate_opacity=300,
        animate_scale=300,
        animate_offset=300,
    )

    # File picker logic
    def on_file_selected(e: ft.FilePickerResultEvent):
        file_chips.controls.clear()

        if e.files:
            empty_label.visible = False
            selected_file_container.padding = 2
            selected_names = []

            for file in e.files:
                name_without_ext = file.name.rsplit(".", 1)[0]
                selected_names.append(file.path)

                chip = ft.Chip(
                    label=ft.Text(
                        name_without_ext,
                        italic=True,
                        size=10,
                        max_lines=1,
                        overflow=ft.TextOverflow.ELLIPSIS,
                    ),
                    data=file.path,
                    bgcolor="blue100",
                    label_style=ft.TextStyle(size=12, weight=ft.FontWeight.W_500),
                )

                def delete_handler(chip_ref=chip):
                    def _(e):
                        file_chips.controls.remove(chip_ref)
                        file_chips.update()

                        files = page.session.get("selected_files") or []
                        files = [f for f in files if f != chip_ref.data]
                        page.session.set("selected_files", files)
                        update_run_button_label()

                        if not file_chips.controls:
                            chip_scroll_container.border = None
                            chip_container_box.visible = False
                            chip_container_box.opacity = 0.0
                            chip_container_box.scale = ft.Scale(0.95)
                            chip_container_box.offset = ft.Offset(0, 0.1)
                            if chip_container_box.page:
                                chip_container_box.update()

                            empty_label.visible = True
                            selected_file_container.padding = 8
                            empty_label.update()
                            selected_file_container.update()

                    return _

                chip.on_delete = delete_handler()
                file_chips.controls.append(chip)

            page.session.set("selected_files", selected_names)
            update_run_button_label()
            file_chips.update()

            chip_container_box.visible = True
            chip_container_box.opacity = 1.0
            chip_container_box.offset = ft.Offset(0, 0)
            chip_container_box.scale = ft.Scale(1.0)
            if chip_container_box.page:
                chip_container_box.update()
        else:
            empty_label.visible = True
            selected_file_container.padding = 8

        empty_label.update()
        selected_file_container.update()

    file_picker = ft.FilePicker(on_result=on_file_selected)

    file_picker_button = ft.ElevatedButton(
        text="Browse Files",
        icon=ft.Icons.UPLOAD_FILE,
        on_click=lambda e: file_picker.pick_files(allow_multiple=True, allowed_extensions=["xlsx"]),
        style=ft.ButtonStyle(
            padding=10,
            elevation={"hovered": 6, "pressed": 2, "default": 2, "disabled": 0},
            bgcolor={
                "default": "#3F3D56",     # Default
                "hovered": "#353349",     # Slightly darker
                "pressed": "#2B293C",     # Darker pressed
                "disabled": "#C7C7CC"     # Light grey
            },
            color={
                "default": "white",
                "disabled": "#888888"
            },
            shape=ft.RoundedRectangleBorder(radius=6),
            animation_duration=300
        )
    )

    # Register file picker
    page.overlay.append(file_picker)

    # Right container (chip area)
    selected_file_container = ft.Container(
        content=ft.Column([
            empty_label,
            chip_container_box
        ],
        spacing=6),
        padding=8,
        bgcolor="white",
        border=ft.border.all(1, "grey200"),
        border_radius=ft.border_radius.all(8),
        expand=True,
        col={"xs": 12, "md": 9}
    )

    # Left container (file picker button)
    file_picker_button_container = ft.Container(
        content=file_picker_button,
        alignment=ft.alignment.center_left,
        col={"xs": 12, "md": 3}
    )

    # Add file picker and selected files row
    page.add(
        ft.ResponsiveRow(
            controls=[
                file_picker_button_container,
                selected_file_container
            ],
            spacing=8,
            run_spacing=8,
        )
    )
    
    page.add(ft.Divider(height=5, thickness=0.2, color="grey"))
   
    # Add run button row
    page.add(
        ft.ResponsiveRow(
            controls=[
                ft.Container(
                    content=run_button,
                    alignment=ft.alignment.center,  # ✅ Center within full width
                    col={"xs": 12}  # ✅ Full 12-column width
                )
            ],
            spacing=10,
            run_spacing=10,
        )
    )

    # ---------- Progress and Log Area ----------
    processing_label = ft.Text(
        value="",
        size=14,
        weight=ft.FontWeight.W_500,
        color="#3F3D56",
        visible=False
    )

    progress_bar = ft.ProgressBar(value=0, bgcolor="grey200", color="blue", height=6, expand=True)
    progress_container = ft.Column(
        controls=[
            processing_label,
            progress_bar
        ],
        spacing=4,
        visible=False
    )
    page.add(progress_container)

    def add_log_line(message: str):
        log_list_view.controls.append(ft.Text(message, size=12, selectable=True))

        # Limit visible height to max 5 rows (~24px each)
        if len(log_list_view.controls) > 5:
            log_list_view.height = 10 * 24
        else:
            log_list_view.height = None

        log_list_view.visible = True
        log_scroll_view.visible = True

        log_list_view.update()
        log_scroll_view.update()


    log_list_view = ft.ListView(
        controls=[],
        spacing=4,
        auto_scroll=True,
        padding=10,
        visible=False,
        expand=False,
        col={"xs": 12}
    )

    log_scroll_view = ft.Container(
        content=log_list_view,
        bgcolor="white",
        border=ft.border.all(1, "grey200"),
        border_radius=ft.border_radius.all(8),
        visible=False,
        col={"xs": 12}
    )

    # Add to page after progress bar
    page.add(
        ft.ResponsiveRow(
            controls=[log_scroll_view],
            spacing=10,
            run_spacing=10
        )
    )

    async def collect_alternate_moderator():
        # To store user input
        user_input = {"value": None}
        future = asyncio.Future()

        # Input field
        input_field = ft.TextField(
            label="Enter alternate moderator's ID or email",
            autofocus=True,
            width=300
        )

        # Reference to dialog
        dialog = ft.AlertDialog()

        # State for Proceed button
        proceed_btn = ft.ElevatedButton(
            "Proceed",
            on_click=lambda e: submit_input(e),
            disabled=True,  # Start disabled
            bgcolor="#0ca678",
            color=ft.Colors.WHITE
        )
        cancel_btn = ft.TextButton("Cancel", on_click=lambda e: cancel_input(e))

        def on_input_change(e):
            # Remove commas and spaces as user types
            cleaned = input_field.value.replace(",", "").replace(" ", "")
            if input_field.value != cleaned:
                input_field.value = cleaned
                page.update()
            # Enable Proceed only if not empty (after stripping both)
            proceed_btn.disabled = not bool(input_field.value.strip())
            proceed_btn.update()

        input_field.on_change = on_input_change

        def submit_input(e):
            trimmed = input_field.value.strip()
            if not trimmed:
                return
            user_input["value"] = trimmed
            dialog.open = False
            page.update()
            future.set_result(user_input["value"])

        def cancel_input(e):
            user_input["value"] = None
            dialog.open = False
            page.update()
            future.set_result(None)

        dialog.title = ft.Text("Alternate moderator required.", weight=ft.FontWeight.BOLD)
        dialog.content = ft.Column(
            [
                ft.Text("Please enter Moderator ID (commas not allowed):"),
                input_field
            ],
            tight=True,
            spacing=10
        )
        dialog.actions = [proceed_btn, cancel_btn]
        dialog.actions_alignment = ft.MainAxisAlignment.END

        page.dialog = dialog
        page.open(dialog)

        return await future


    async def process_test(
            file_path: str,
            top_selected_booklets: int,
            middle_selected_booklets: int,
            bottom_selected_booklets: int,
            top_picked_booklets: int,
            middle_picked_booklets: int,
            bottom_picked_booklets: int,
            individual_files: bool,
            bulk_file: bool
        ):

        global count_unusual_evaluation_cycle_files
        global count_successfully_processed_files
        global skip_processing_current_file
        global master_bulk_allocation_df

        # skip_processing_current_file = False

        print(f"Started processing: {os.path.splitext(os.path.basename(file_path))[0]}")
        print(f"Selected Booklets => Top: {top_selected_booklets}%, Middle: {middle_selected_booklets}%, Bottom: {bottom_selected_booklets}%")
        print(f"Picked Booklets => Top: {top_picked_booklets}%, Middle: {middle_picked_booklets}%, Bottom: {bottom_picked_booklets}%")
        print(f"Output Options => Individual Files: {individual_files}, Bulk File: {bulk_file}")

        df = pd.read_excel(file_path, dtype={'Registration Number': str})
        invalid_cycles = df[~df['Cycle'].isin(['primary', '-'])]
        # global count_unusual_evaluation_cycle_files
        if not invalid_cycles.empty:
            list_unusual_evaluation_cycle_files.add(os.path.splitext(os.path.basename(file_path))[0])
            count_unusual_evaluation_cycle_files += 1
            add_log_line(f"{" " * 8}⛔ Skipped processing. Found invalid cycles: {', '.join(invalid_cycles['Cycle'].unique())}")
        else:
            add_log_line(f"{" " * 8}✅ No invalid evaluation cycle found.")
            df = df[df['Cycle'] == 'primary'].copy()
            total_evaluators = df['Evaluated By'].nunique()
            total_scripts = len(df)
            print(f'Total Scripts: {len(df)}')
            print(f'Total Evaluators: {total_evaluators}')

            # Use values from GUI
            top_count = math.ceil(total_scripts * top_picked_booklets / 100)
            middle_count = math.ceil(total_scripts * middle_picked_booklets / 100)
            bottom_count = math.ceil(total_scripts * bottom_picked_booklets / 100)

            sorted_data = df.sort_values(by=['Evaluated By', 'Total Marks'], ascending=[True, False])
            sorted_data = sorted_data.reset_index(drop=True)
            sorted_data['Scoring Category'] = None
            sorted_data['Selected for Moderation'] = 'Not Selected'

            unique_evaluators = sorted_data['Evaluated By'].unique()

            for evaluator in unique_evaluators:
                evaluator_data = sorted_data[sorted_data['Evaluated By'] == evaluator]
                total_scripts_evaluator = len(evaluator_data)
                top_count = math.ceil(total_scripts_evaluator * top_selected_booklets / 100)
                bottom_count = math.ceil(total_scripts_evaluator * bottom_selected_booklets / 100)

                sorted_data.loc[evaluator_data.index[:top_count], 'Scoring Category'] = f'Top {top_selected_booklets}%'
                sorted_data.loc[evaluator_data.index[-bottom_count:], 'Scoring Category'] = f'Bottom {bottom_selected_booklets}%'
                sorted_data.loc[
                    evaluator_data.index[top_count:total_scripts_evaluator - bottom_count],
                    'Scoring Category'
                ] = f'Middle {middle_selected_booklets}%'

            for evaluator in unique_evaluators:
                evaluator_data = sorted_data[sorted_data['Evaluated By'] == evaluator]
                total_scripts_evaluator = len(evaluator_data)
                for category, pick_percent in zip(
                    [f'Top {top_selected_booklets}%', f'Middle {middle_selected_booklets}%', f'Bottom {bottom_selected_booklets}%'],
                    [top_picked_booklets, middle_picked_booklets, bottom_picked_booklets]
                ):
                    # Calculate the pick count as a % of *total scripts for this evaluator*
                    pick_count = math.ceil(total_scripts_evaluator * pick_percent / 100)
                    category_rows = evaluator_data[evaluator_data['Scoring Category'] == category]
                    # Only pick as many as available in that category
                    if pick_count > 0 and not category_rows.empty:
                        selected_indices = category_rows.sample(
                            min(len(category_rows), pick_count), random_state=42
                        ).index
                        sorted_data.loc[selected_indices, 'Selected for Moderation'] = 'Selected'


            sorted_data['Moderator'] = None
            evaluator_pool = sorted_data['Evaluated By'].unique().tolist()

            if len(evaluator_pool) == 1:
                global sole_evaluator
                sole_evaluator = evaluator_pool[0]
                add_log_line(f"{" " * 8}⚠️ Single evaluator found: {', '.join(evaluator_pool)}")

                async def alternate_evaluator_required():
                    global alternate_eval_choice
                    future = asyncio.Future()
                    alternate_evaluator_required_dialogue = ft.AlertDialog()

                    async def handle_click(e):
                        global alternate_eval_choice
                        global sole_evaluator
                        global skip_processing_current_file
                        global count_user_skipped_files
                        if e.control.data == "sameEvaluator":
                            add_log_line(f"{" " * 8}✅ User chose to assign same evaluator: {sole_evaluator}")
                            alternate_evaluator_required_dialogue.open = False
                            moderator_mapping = {sole_evaluator: sole_evaluator}
                            sorted_data['Moderator'] = sorted_data['Evaluated By'].map(moderator_mapping)
                            page.update()
                            future.set_result(alternate_eval_choice)
                        
                        elif e.control.data == "assignOtherEvaluator":
                            alternate_evaluator_required_dialogue.open = False
                            page.update()
                            add_log_line(f"{" " * 8}✅ User chose to assign different evaluator")
                            moderator_id = await collect_alternate_moderator()
                            
                            if moderator_id:
                                moderator_mapping = {sole_evaluator: moderator_id}
                                sorted_data['Moderator'] = sorted_data['Evaluated By'].map(moderator_mapping)
                                add_log_line(f"{" " * 8}✅ User entered new moderator ID: {moderator_id}")
                            else:
                                skip_processing_current_file = True
                                count_user_skipped_files += 1
                                list_user_skipped_files.add(os.path.splitext(os.path.basename(file_path))[0])
                                add_log_line(f"{" " * 8}⛔ User cancelled entering moderator ID.")
                                # alternate_eval_choice = None

                            future.set_result(alternate_eval_choice)

                        elif e.control.data == "skipProccessing":
                            count_user_skipped_files += 1
                            list_user_skipped_files.add(os.path.splitext(os.path.basename(file_path))[0])
                            add_log_line(f"{" " * 8}⛔ User chose to skip processing the file")
                            skip_processing_current_file = True
                            print(f"Skip Processing_current file: {skip_processing_current_file}")
                            alternate_evaluator_required_dialogue.open = False
                            page.update()
                            future.set_result(alternate_eval_choice)


                    alternate_evaluator_required_dialogue.title = ft.Text("Oops!!! No alternate moderator available.", weight=ft.FontWeight.W_500)
                    alternate_evaluator_required_dialogue.content = ft.Text("Choose an option to proceed:", size=14, weight=ft.FontWeight.W_500)
                    alternate_evaluator_required_dialogue.actions = [
                        ft.ElevatedButton("Assign Same Evaluator", data="sameEvaluator", on_click=handle_click),
                        ft.ElevatedButton("Assign New Moderator", data="assignOtherEvaluator", on_click=handle_click),
                        ft.ElevatedButton("Skip Processing", data="skipProccessing", on_click=handle_click),
                    ]
                    alternate_evaluator_required_dialogue.actions_alignment = ft.MainAxisAlignment.END

                    page.dialog = alternate_evaluator_required_dialogue
                    page.open(alternate_evaluator_required_dialogue)
                    page.update()
                    return await future

                await alternate_evaluator_required()
            
            else:
                add_log_line(f"{" " * 8}✅ Multiple evaluators found, good to go.")
                random.shuffle(evaluator_pool)
                remaining_moderators = evaluator_pool.copy()
                moderator_mapping = {}

                for evaluator in evaluator_pool:
                    available_moderators = [mod for mod in remaining_moderators if mod != evaluator]
                    if available_moderators:
                        moderator = random.choice(available_moderators)
                        moderator_mapping[evaluator] = moderator
                        remaining_moderators.remove(moderator)

                sorted_data['Moderator'] = sorted_data['Evaluated By'].map(moderator_mapping)

            selected_filter = sorted_data[sorted_data['Selected for Moderation'] == 'Selected']

            allocation_summary_df = pd.pivot_table(
                selected_filter,
                index=['Evaluated By', 'Scoring Category'],
                values='Total Marks',
                aggfunc={'Total Marks': ['min', 'max']}
            ).reset_index()

            allocation_summary_df.columns = [
                col.replace("max", "Max Marks").replace("min", "Min Marks") if isinstance(col, str) else col
                for col in allocation_summary_df.columns
            ]
            allocation_summary_df = allocation_summary_df[['Evaluated By', 'Scoring Category', 'Min Marks', 'Max Marks']]

            bulk_allocation_df = sorted_data[sorted_data['Selected for Moderation'] == 'Selected'][['Schedule Id', 'Email of the student', 'Moderator']].copy()
            bulk_allocation_df.rename(columns={
                'Schedule Id': 'Test Id',
                'Email of the student': 'User Id',
                'Moderator': 'Evaluator Ids'
            }, inplace=True)

            if skip_processing_current_file == False:
                if individual_files:
                    dir_path = os.path.dirname(file_path)
                    filename = f'bulk_allocation_{os.path.basename(file_path)}'
                    output_file = os.path.join(dir_path, f'{filename}')
                    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                        bulk_allocation_df.to_excel(writer, sheet_name='BulkAllocation', index=False)
                        sorted_data.to_excel(writer, sheet_name='MasterAllocationData', index=False)
                        allocation_summary_df.to_excel(writer, sheet_name='AllocationSummary', index=False)
                    add_log_line(f"{" " * 8}✅ File successfully procesed and saved at {os.path.basename(file_path)}")
                    count_successfully_processed_files +=1
                    list_successfully_processed_files.add(os.path.basename(file_path))
                elif not individual_files:
                    add_log_line(f"{" " * 8}✅ File Procesed but individual file not saved as per user choice")
                    count_successfully_processed_files +=1
                    list_successfully_processed_files.add(os.path.basename(file_path))

            if bulk_file:
                if master_bulk_allocation_df.empty:
                    master_bulk_allocation_df = bulk_allocation_df.copy()
                else:
                    master_bulk_allocation_df = pd.concat([master_bulk_allocation_df, bulk_allocation_df], ignore_index=True)

ft.app(target=main)
