import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Wolf} from '../../models/wolf';
import {WolfService} from '../../services/wolf.service';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-select-wolf-dialog',
  templateUrl: './select-wolf-dialog.component.html',
  styleUrls: ['./select-wolf-dialog.component.scss'],
  providers: [WolfService]
})
export class SelectWolfDialogComponent implements OnInit {
  wolves: Wolf[] = [];

  public dialogRef: MatDialogRef<SelectWolfDialogComponent>;

  private wolfService: WolfService;
  private wolvesToAdd: Wolf[] = [];
  WolvesTableColumns = ['name', 'gender', 'birthday', 'actions'];

  constructor(
    dialogRef: MatDialogRef<SelectWolfDialogComponent>,
    wolfService: WolfService,
    @Inject(MAT_DIALOG_DATA) public data: { wolvesInPack: Wolf[] },
    @Inject(DOCUMENT) document) {

    this.wolfService = wolfService;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    // Load all wolves, filter the ones already in the current pack
    this.wolfService.getWolves().subscribe((wolves: Wolf[]) => {
      for (const wolf of wolves){
        if (this.data.wolvesInPack.findIndex(wolfInPack => wolfInPack.id === wolf.id) === -1 ){
          this.wolves.push(wolf);
        }
      }
    });
  }

  // Close without saving
  closeDialog(): void{
    this.dialogRef.close(null);
  }

  // Close and add selected wolves
  saveDialog(): void {
    this.dialogRef.close(this.wolvesToAdd);
  }

  addWolfBtnClicked(id: number): void {
    // Check if wolf is already in array, if so remove it and change the button back to the add icon.
    const index = this.wolvesToAdd.findIndex(wolf => wolf.id === id);
    if (index > -1){
      console.log(index);
      this.wolvesToAdd.splice(index, 1);
      document.getElementById('icon-wolf-' + id).innerHTML = 'add';

      return;
    }

    // Add wolf to array and change icon in button to a checkmark.
    this.wolvesToAdd.push(this.wolves.find(wolf => wolf.id === id));
    document.getElementById('icon-wolf-' + id).innerHTML = 'done';
  }
}
